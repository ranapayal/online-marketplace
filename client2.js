const {io}=require('socket.io-client');
const readline=require('readline');

//Create readline interface for user input
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

let socket=null;
let isConnected=false;

console.log('Client starting...');
console.log('Attempting to connect to server on localhost:8080...\n');

//Connect to server
function connectToServer()
{
    socket=io('http://localhost:8080',{
        reconnection:true,
        reconnectionDelay:1000,
        reconnectionAttempts:5,
        timeout:20000
    });

    //Handle connection success
    socket.on('connect',()=>{
        isConnected=true;
        console.log('Connected to server!');
        console.log('You can now start chatting. Type your message and press Enter.\n');
    });

    //Handle incoming messages from server
    socket.on('message',(data)=>{
        console.log(`Server:${data.message}`);
    });

    //Handle connection disconnect
    socket.on('disconnect',(reason)=>{
        isConnected=false;
        console.log(`Disconnected from server:${reason}`);
    });

    //Handle reconnection attempts
    socket.on('reconnect_attempt',(attemptNumber)=>{
        console.log(`Reconnection attempt ${attemptNumber}...`);
    });

    //Handle successful reconnection
    socket.on('reconnect',(attemptNumber)=>{
        isConnected=true;
        console.log(`Reconnected to server after ${attemptNumber} attempts!`);
    });

    //Handle reconnection failure
    socket.on('reconnect_failed',()=>{
        console.log('Failed to reconnect to server');
    });

    //Handle connection errors
    socket.on('connect_error',(error)=>{
        console.error('Connection error:',error.message);
        console.log('Make sure the server is running on port 8080');
    });
}

//Function  to send message to server
function sendMessage(message)
{
    if(socket && isConnected)
    {
        socket.emit('message',{message:message});
        console.log(`You:${message}`);
    }else{
        console.log('Not connected to server');
    }
}

//Handle user input
rl.on('line',(input)=>{
    if(input.trim()==='')
        return;
    if(input.toLowerCase()==='quit' || input.toLowerCase()==='exit')
    {
        comsole.log('Client disconnecting...');
        if(socket)
        {
            socket.disconnect();
        }
        process.exit(0);
    }
    if(input.toLowerCase()==='reconnect')
    {
        console.log('Manually reconnecting...');
        if(socket)
        {
            socket.disconnect();
        }
        connectToServer();
        return;
    }
    if(input.toLowerCase()==='status')
    {
        console.log(`connection status:${isConnected ? 'Connected' : 'Disconnected'}`);
        return;
    }
    sendMessage(input);
});

//Handle client shutdown
process.on('SIGINT',()=>{
    console.log('\n Client shutting down...');
    if(socket)
    {
        socket.disconnect();
    }
    process.exit(0);
});

//start connection
connectToServer();

console.log('Commands:');
console.log('-Type any message and press Enter to send');
console.log('-Type "status" to check connection status');
console.log('-Type "reconnect" to manually reconnect');
console.log('-Type "quit" or "exit" to close the server');
console.log('-Press Ctrl+C to force quit\n');