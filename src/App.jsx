import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const App = () => {

  const [ item, setItem ] = useState('something');
  const [ todo, setTodo ] = useState([]);

  const handleTodo = () => {
    if(item.trim = '') {
      setItem('');
      setTodo([...todo, item]);
    }
  };


  return (
    <div>
      <h1>To-do List App</h1>
    
      <div>
         <input 
         type="text"
        value={item}
        onChange={(e) => setItem(e.target.value)}
          />
          <button
          onClick={handleTodo}
          >Add+</button>
     </div>
  

    <div className='cointainer'>
         {
          <p key={index}>{}</p>
         }
    </div>
    </div>
  )
};

export default App
