const socket = io()
//Elements
const form = document.querySelector('#message-form')
const formInput = form.querySelector('input')
const formButton = form.querySelector('button')
const send_locationBtn = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMsgTemplate = document.querySelector('#locationMsg-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//Functions

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = messages.offsetHeight

    //Height of messages container
    const containerHeight = messages.scrollHeight

    //How far have we scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}

// --------------------------------------

//Socket listeners
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (locationMessage) => {
    console.log(locationMessage)
    const html = Mustache.render(locationMsgTemplate, {
        username: locationMessage.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// -------------------------------------------------------

// Socket emits
socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})
// --------------------------------------------------------


//Event listeners
form.addEventListener('submit', (e) => {
    e.preventDefault()

    //Disable form button
    formButton.setAttribute('disabled', 'disabled')
    //--------------------
    const message = e.target.elements.messaging.value

    socket.emit('sendMessage', message, (err) => {
        //Enabeling the form button
        formButton.removeAttribute('disabled')
        formInput.value = ''
        formInput.focus()
        //-------------------------
        if(err)
            return console.log(err)

        console.log('Message Delivered')
    })
})

send_locationBtn.addEventListener('click', () => {
    if(!navigator.geolocation)
        return alert('Location is not supported by your browser')

    //Disabling the button
    send_locationBtn.setAttribute('disabled', 'disabled')
    //--------------------
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (msg) => {
            send_locationBtn.removeAttribute('disabled')
            console.log(msg)
        })
    })
})

// --------------------------------------------------------