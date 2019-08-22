import * as React from 'react';

type EventFunction = (event: any) => void;
export default ({onClick = jest.fn}: {onClick?: EventFunction} = {}) => (
    <div className='test-container' data-testid='test-container'>
        <div data-testid='spans-container'>
            <span data-testid='span' data-value='Span 1' data-active>Span 1</span>
            <span data-testid='span' data-value='Span 2'>Span 2</span>
            <span data-testid='span' data-value='Span 3' data-active>Span 3</span>
        </div>
        <div data-testid='button-container'>
        <button data-testid='test-button' onClick={onClick} data-value="Test Button">
            Test Button
        </button>
        </div>
    </div>
)
