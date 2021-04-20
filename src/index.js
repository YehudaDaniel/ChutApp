const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express()
//Express does this behind the scenes, but I need acces to it in order to customize it
const server = http.createServer(app)
const io = socketio(server)

const PORT = 3000 || process.env.PORT

//Defining paths for express config
const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))

//GET request
app.get('/', (req, res) => {
    res.render('index')
})


// server (emit) -> client (recieve) - countUpdated
// client (emit) -> server (recieve) - increment
//socket - the requester
//io = socketio(server) - everybody, every single socket
//broadcast - everyone except this particular socket
//io.to.emit - sends an event to everyone in a room without sending it to people in other rooms
//socket.broadcast.to.emit - sends an event to everyone except to the client, in a specific room


let greet = 'Welcome!'

io.on('connection', (socket) => {
    console.log('New WebSocket connection; index.js')

    //Listens
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room })
        //if an error exists the function will end and return the error
        if(error)
            return callback(error)

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', greet))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg))
            return callback('Profanity is not allowed')

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Location shared')
    })
})

//Listening to a port from the environment variable to run the server on
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}; index.js`)
})