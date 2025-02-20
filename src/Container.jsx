import React from "react";

const Container = ({ todo }) => {

    return (
        <>
          {todo.map((item, index) => (
            <div className='container' key={index}> 
              <p
                onClick={(e) => {
                e.target.style.textDecoration = e.target.style.textDecoration === 'line-through' ? 'none' : 'line-through';
                e.target.style.color = e.target.style.color === 'grey' ? '#322f2f' : 'grey';
               }}
               onDoubleClick={(e) => {
                 e.target.setAttribute('contenteditable', true);
               }}
                onBlur={(e) => {
                    e.target.setAttribute('contenteditable', false);
                }}>
              {item}
              </p>
              <span
              onClick={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
              >x</span>
          </div>
        ))}
        </>
    )

};

export default Container;