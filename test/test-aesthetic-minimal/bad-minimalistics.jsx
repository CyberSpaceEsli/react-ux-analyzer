import React from 'react';

function ClutteredComponent() {
  return (
    <>
    <div className="p-4 bg-white">
      {/* More than 3 primary colors (Tailwind + inline style) */}
      <h1 className="text-red-500">Heading in red</h1>
      <p className="text-blue-600">Text in blue</p>
      {/* <p className="text-green-500">Text in green</p> */}
      <p style={{ color: '#ff9900' }}>Text in orange (inline)</p>
    </div>

     {/* Same style used for clickable and non-clickable */}
    <div className="bg-gray-100 p-2 text-center">This looks clickable but is not</div>
    <button className="bg-gray-100 p-2 text-center" onClick={() => alert('Clicked')}>
        Click Me
    </button>

    <span className="bg-gray-100 p-2 text-center">Also looks like a button</span>
  </>
  );
}

/*function ManyInlineColors() {
    return (
        <div style={{ color: 'red'}}>
        <p style={{ color: 'blue'}}> </p>
        <span style={{ color: 'green'}}> </span>
        <div style={{ color: 'orange'}}> </div>
        </div>
    );
}*/

function SimilarStyleDifferentFunctionality() {
    return (
        <div className="p-4 bg-white">
        <button className="text-red-500 border p-2 m-2">Clickable Button</button>
        <div className="text-red-500 border p-2 m-2">Non-clickable Div</div>
        </div>
    );
}

export { ClutteredComponent, SimilarStyleDifferentFunctionality };