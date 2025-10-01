const WebSocket=require('ws');
const readline=require('readline');

//Create readline interface for user input
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

let ws=null;
let isConnected=false;

console.log('Client starting...');
console.log('Attempting to connect to server on localhost:8080...\n');

//Connect to server
function connectToServer()
{
    ws=new WebSocket('ws://localhost:8080');

    //Handle connection open
    ws.on('open',()=>{
        isConnected=true;
        console.log('connected to server!');
        console.log('You can now start chatting. Type your message and press Enter.\n');
    });

    ws.on('message',(message)=>{
        const msg=message.toString();
        console.log(`Server:${msg}`);
    });

    ws.on('close',()=>{
        isConnected=false;
        console.log('Connection to server closed');
    });

    ws.on('error',(error)=>{
        console.error('connection error:',error.message);
        console.log('Make sure the server is running on port 8080');
    });
}

//Function to send message to server
function sendMessage(message)
{
    if(ws && isConnected)
    {
        ws.send(message);
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
        console.log('Client disconnecting...');
        if(ws)
        {
            ws.close();
        }
        process.exit(0);
    }
    if(input.toLowerCase()==='reconnect')
    {
        console.log('Attempting to reconnect...');
        connectToServer();
        return;
    }
    sendMessage(input);
});

//Handle client shutdown
process.on('SIGINT',()=>{
    console.log('\n Client shutting down...');
    if(ws)
    {
        ws.close();
    }
    process.exit(0);
});

//Start connection
connectToServer();

console.log('Commands:');
console.log('-Type any message and press Enter to send');
console.log('-Type "quit" or "exit" to close the server');
console.log('-Press Ctrl+C to force quit\n');