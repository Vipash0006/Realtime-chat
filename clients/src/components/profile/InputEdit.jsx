import React, { useState } from 'react';
import { TbEdit } from "react-icons/tb";
import { BsCheck2 } from "react-icons/bs";

function InputEdit({ type, handleChange, input, handleSubmit }) {
  const [editable, setEditable] = useState(false);

  const submitButton = () => {
    handleSubmit();
    setEditable(false);
  };

  return (
    <div className='flex flex-col py-3 mt-4 bg-white shadow-md px-4 gap-y-2 rounded-md'>
      <p className='text-[12px] text-[#166e48] font-medium tracking-wide capitalize'>{type}</p>
      {
        !editable ? (
          <div className='flex justify-between items-center'>
            <p className='text-[14.5px] text-[#3b4a54] break-words max-w-[80%]'>{input}</p>
            <button onClick={() => setEditable(true)}>
              <TbEdit className='w-5 h-5' />
            </button>
          </div>
        ) : (
          <div className='flex items-center justify-between'>
            <input
              name={type}
              onChange={handleChange}
              className='text-[14.5px] text-[#3b4a54] outline-0 bg-transparent w-full'
              type="text"
              value={input}
            />
            <button onClick={submitButton}>
              <BsCheck2 className='w-5 h-5 ml-2' />
            </button>
          </div>
        )
      }
    </div>
  );
}

export default InputEdit;
