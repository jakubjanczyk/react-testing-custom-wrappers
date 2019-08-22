import {mountWithCustomWrappers, withinWithWrapper} from "../src/custom-wrappers";
import * as React from "react";

describe('common methods', () => {
    it('should allow to click on element, when found by custom method', () => {
        const onClick = jest.fn();
        const component = mountWithCustomWrappers(
            <button onClick={onClick}>
                Test Button
            </button>
        );

        withinWithWrapper(component.queryByText('Test Button')).click();

        expect(onClick).toHaveBeenCalled();
    });

    it('should allow to blur element, when found by custom method', () => {
        const onBlur = jest.fn();
        const component = mountWithCustomWrappers(
            <button onBlur={onBlur}>
                Test Button
            </button>
        );

        withinWithWrapper(component.queryByText('Test Button')).blur();

        expect(onBlur).toHaveBeenCalled();
    });

    it('should allow to focus element, when found by custom method', () => {
        const onFocus = jest.fn();
        const component = mountWithCustomWrappers(
            <button onFocus={onFocus}>
                Test Button
            </button>
        );

        withinWithWrapper(component.queryByText('Test Button')).focus();

        expect(onFocus).toHaveBeenCalled();
    });

    it('should allow to type into input element, when found by custom method', () => {
        const onChange = jest.fn();
        const component = mountWithCustomWrappers(<input data-testid="test-input" onChange={(event) => onChange(event.target.value)}/>);

        const text = 'some text';
        withinWithWrapper(component.queryByTestId('test-input')).typeText(text);

        expect(onChange).toHaveBeenCalledWith(text);
    });
});
