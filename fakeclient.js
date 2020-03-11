const socket = require('socket.io-client')
const connection = socket('http://localhost:3000')

// connection.on('message', (data) => {
//     console.log(data);
// });

connection.on('whoyouare', () => {
    connection.emit('whoiam', { name: 'TestUser', role: 2 })
    connection.on('welcome', (data) => {
        console.log('Client.welcome', data)
    })
});
connection.on('error', (error) => {
    console.error(error);
})
