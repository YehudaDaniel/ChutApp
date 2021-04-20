const users = []

// Add user - start tracking a user
const addUser = ({ id, username, room }) => {
    //Cleaning the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //Validate the data
    if(!username || !room )
        return {
            error: 'Username and room are required'
        }
    
    //Check for existing user
    const existingUser = users.find(user => {
        return user.room === room && user.username === username
    })
    //Validate username
    if(existingUser)
        return {
            error: 'Username is already in use'
        }

    //Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// Remove user - stop tracking a user when he leaves
const removeUser = (id) => {
    //returns an index. -1 for no match, 0 or greater for a match
    const index = users.findIndex(user => user.id === id)
    //Returns the users list without the requested user to remove
    if(index !== -1)
        return users.splice(index, 1)[0]
}
// Get user - fetch an existing user's data
const getUser = (id) => {
    //Returns the data of the requested user
    return users.find(user => user.id === id)
}
// Get users in a room - get a complete list of all of the users in a specific room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    //Returns all the users in the room or nothing if a room is empty
    return users.filter(user => user.room === room)
}



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}