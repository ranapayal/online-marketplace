const WebSocket=require('ws');
const readline=require('readline');

//create WebSocket server
const wss=new WebSocket.Server({port:8080});

//create readline interface for user input
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

let clientSocket=null;

console.log('server started on port 8080');
console.log('Waiting for client to connect...\n');

//handle new client connections
wss.on('connection',(ws)=>{
    clientSocket=ws;
    console.log('Client connected!');
    console.log('You can now start chatting. Type your message and press Enter.\n');

    ws.on('message',(message)=>{
        const msg=message.toString();
        console.log(`Client:${msg}`);
    });

    ws.on('close',()=>{
        console.log('Client disconnected');
        clientSocket=null;
    });

    ws.on('error',(error)=>{
        const msg=message.toString();
        console.error('WebSocket error:',error);
    });
});

//Function to send message to client
function sendMessage(message)
{
    if(clientSocket && clientSocket.readyState===WebSocket.OPEN)
    {
        clientSocket.send(message);
        console.log(`You:${message}`);
    }else{
        console.log('No client connected or connection is closed');
    }
}

//Handle user input
rl.on('line',(input)=>{
    if(input.trim()==='')
        return;
    if(input.toLowerCase()==='quit' || input.toLowerCase()==='exit')
    {
        console.log('server shutting down...');
        if(clientSocket)
        {
            clientSocket.close();
        }
        process.exit(0);
    }
    sendMessage(input);
});

//Handle server shutdown
process.on('SIGINT',()=>{
    console.log('\n server shutting down...');
    if(clientSocket)
    {
        clientSocket.close();
    }
    wss.close();
    process.exit(0);
});

console.log('Commands:');
console.log('-Type any message and press Enter to send');
console.log('-Type "quit" or "exit" to close the server');
console.log('-Press Ctrl+C to force quit\n');