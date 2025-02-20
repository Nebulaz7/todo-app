import { useState } from 'react'
import './App.css'

import Container from './Container';

const App = () => {

  const [ item, setItem ] = useState('');
  const [ todo, setTodo ] = useState([]);

  const handleTodo = () => {
    if(item.trim() !== '') {
      setTodo([...todo, item]);
      setItem('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };


  return (
    <div>
      <h1>To-do List App</h1>
    
      <div className='header'>
         <input 
         type="text"
        value={item}
        onChange={(e) => setItem(e.target.value)}
          />
          <button
          onClick={handleTodo}
          onKeyDown={handleKeyPress}
          placeholder='Add a to-do item'
          >Add+</button>
     </div>
   
      <Container todo={todo} />

    </div>
  )
};

export default App
