import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';
import { AiOutlineSend } from 'react-icons/ai';
import ScrollToBottom from 'react-scroll-to-bottom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Home = () => {
  const messageSave = localStorage.getItem('message') ? JSON.parse(localStorage.getItem('message')) : []
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [chatActive, setChatActive] = useState(false);
  const [messages, setMessages] = useState(messageSave);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('message', JSON.stringify(messages))
  }, [messages])


  useEffect(() => {
    socket.on('receive_message', (message) => {
      console.log('Message received:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up the event listener on component unmount
    return () => {
      socket.off('receive_message');
    };
  }, []);

  // Update local storage whenever messages change


  const handleJoinRoom = () => {
    if (username.trim() !== "" && room.trim() !== "") {
      socket.emit('join_room', room);
      setChatActive(true);
    } else {
      toast.error('Username and room are required');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const messageData = {
      room,
      message: newMessage,
      user: username,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (newMessage.trim() !== "") {
      socket.emit('send_message', messageData);
      setMessages([...messages, messageData]);
      console.log(messageData);
      setNewMessage('');
    } else {
      toast.error('Message cannot be empty');
    }
  };

  return (
    <>
      <Toaster />
      <div className='h-screen w-screen flex justify-center items-center bg-slate-100'>
        {chatActive ? (
          <div className='rounded-md w-full md:w-[80vw] lg:w-[50vw] p-3 shadow-2xl bg-slate-100'>
            <header className='flex justify-center'>
              <h1><img src="logo.png" alt="Logo" className='h-7 w-7' /></h1>
            </header>
            <h1 className='text-center font-bold text-lg my-2 uppercase'>{username} : Live</h1>
            <ScrollToBottom className='h-[55vh] lg:h-[52vh]'>
              {messages.map((e, index) => (
                <div
                  key={index}
                  className={`flex my-5 w-fit ${username === e.user ? "ml-auto bg-blue-200" : "mr-auto bg-gray-200"} rounded-md shadow-md p-3`}
                >
                  <div className={`flex items-center p-2 ${username === e.user ? "bg-blue-400" : "bg-gray-400"} rounded-full h-10 w-10 justify-center`}>
                    <h1 className='font-bold text-white'>{e.user.charAt(0).toUpperCase()}</h1>
                  </div>
                  <div className='ml-3'>
                    <span className='text-sm'>{e.user}</span>
                    <h3 className='font-bold'>{e.message}</h3>
                    <h2 className='text-xs text-right'>{e.time}</h2>
                  </div>
                </div>
              ))}
            </ScrollToBottom>
            <div>

              <form onSubmit={handleSubmit} className='flex gap-3 md:gap-4 justify-between'>
                <input
                  type="text"
                  placeholder='Type Your Message'
                  className='py-3 rounded-md outline-none border-2 px-2 w-full'
                  onChange={(e) => setNewMessage(e.target.value)}
                  value={newMessage}
                />
                <button type='submit' className='bg-green-900 py-3 rounded-md px-6 font-bold text-white border-2 outline-none'>
                  <AiOutlineSend className='text-lg' />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className='h-screen w-screen flex justify-center items-center gap-3 flex-col'>
            <img src="chat.png" alt="Chat" className='w-25 h-20 cursor-pointer' />
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              placeholder='Username'
              className='text-center py-3 px-3 border-2 outline-none rounded-md text-black'
            />
            <input
              type="text"
              onChange={(e) => setRoom(e.target.value)}
              value={room}
              placeholder='Room'
              className='text-center py-3 px-3 border-2 outline-none rounded-md text-black'
            />
            <button
              onClick={handleJoinRoom}
              className='bg-green-600 py-3 rounded-md text-white font-bold p-14'
            >
              Join Room
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
