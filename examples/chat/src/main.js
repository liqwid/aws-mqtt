import AWS from 'aws-sdk/global'
import AWSMqttClient from '../../../lib/index'
import config from '../../config' // NOTE: make sure to copy config.example.js to config.js and fill in your values
import { logEventsToConsole } from './utils'

// Initialize the Amazon Cognito credentials provider
AWS.config.region = config.aws.region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: config.aws.cognito.identityPoolId
})

const client = new AWSMqttClient({
  region: AWS.config.region,
  credentials: AWS.config.credentials,
  endpoint: config.aws.iot.endpoint,
  clientId: 'mqtt-client-' + (Math.floor((Math.random() * 100000) + 1)),
  // clientId: 'mqtt-client-browser',
})

logEventsToConsole(client)

client.on('connect', () => {
  addLogEntry('Successfully connected to AWS MQTT Broker!  :-)')
  client.subscribe(config.topics.time)
  client.subscribe(config.topics.chat)
  client.subscribe('$aws/events/presence/connected/mqtt-client-test')
})
client.on('message', (topic, message) => {
  console.log(message)
  addLogEntry(`${topic} => ${message}`)
})
client.on('close', () => {
  addLogEntry('Closed  :-(')
})
client.on('offline', () => {
  addLogEntry('Went offline  :-(')
})

document.getElementById('send').addEventListener('click', () => {
  const message = document.getElementById('message').value
  client.publish(config.topics.chat, message)
});

function addLogEntry(info) {
  const newLogEntry = document.createElement('li')
  newLogEntry.textContent = '[' + (new Date()).toTimeString().slice(0, 8) + '] ' + info

  const theLog = document.getElementById('the-log')
  theLog.insertBefore(newLogEntry, theLog.firstChild)
}
