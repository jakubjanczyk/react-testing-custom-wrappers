import {createComponentWrapperFor, mountWithCustomWrappers, Wrapper, withinWithWrapper} from '../src/custom-wrappers';
import TestComponent from "../utils/TestComponent";

describe('Custom Wrappers', () => {
    type ButtonWrapper = ReturnType<typeof wrapperForButton>;
    type ContainerWrapper = ReturnType<typeof wrapperForContainer>

    const wrapperForButton = (component: Wrapper) => ({
        clickTestButton: () => withinWithWrapper(component.getByText('Test Button')).click()
    });
    const wrapperForContainer = (component: Wrapper) => ({
        findSecondSpan: () => component.queryByText('Span 2')
    });

    describe('mountWithCustomWrappers', () => {
        it('should preserve basic enzyme Wrapper methods when no custom wrapper provided', () => {
            const component = mountWithCustomWrappers(TestComponent());

            expect(component.queryByTestId('test-container')).not.toBeNull();
        });

        it('should add custom method when just one wrapper provided', () => {
            const onClick = jest.fn();
            const component = mountWithCustomWrappers<ButtonWrapper>(TestComponent({onClick}), wrapperForButton);

            component.clickTestButton();

            expect(onClick).toHaveBeenCalled();
        });

        it('should add custom method when just more than one wrapper provided', () => {
            type MyWrapper = ButtonWrapper & ContainerWrapper
            const onClick = jest.fn();
            const component = mountWithCustomWrappers<MyWrapper>(TestComponent({onClick}), wrapperForButton, wrapperForContainer);

            component.clickTestButton();

            expect(onClick).toHaveBeenCalled();
            expect(component.findSecondSpan()).not.toBeNull();
        });
    });


    describe('using raw createComponentWrapperFor for nested wrapper', () => {
        type NestedContainerWrapper = ReturnType<typeof wrapperForNestedContainer>
        type SpanWrapper = ReturnType<typeof wrapperForSpans>

        const wrapperForSpans = (component: Wrapper) => ({
            dataValue: () => component.baseElement.getAttribute('data-value') as string,
            isActive: () => component.baseElement.getAttribute('data-active') === 'true'
        });
        const customButtonWrapper = createComponentWrapperFor<ButtonWrapper>(wrapperForButton);
        const spanWrapper = createComponentWrapperFor<SpanWrapper>(wrapperForSpans);
        const wrapperForNestedContainer = (component: Wrapper) => ({
            clickNestedButton: () => {
                const buttonContainer = component.getByTestId('button-container');
                customButtonWrapper(withinWithWrapper(buttonContainer)).clickTestButton()
            },
            allActiveSpansDataValues: () => component.getAllByTestId('span')
                .map((el: HTMLElement) => spanWrapper(withinWithWrapper(el)))
                .filter((el: SpanWrapper) => el.isActive())
                .map((el: SpanWrapper) => el.dataValue()),
        });

        it('should allow to nest wrapper inside other wrappers', () => {
            const onClick = jest.fn();
            const component = mountWithCustomWrappers<NestedContainerWrapper>(TestComponent({onClick}), wrapperForNestedContainer);

            component.clickNestedButton();

            expect(onClick).toHaveBeenCalled();
        });

        it('should work with inner wrapper used on multiple elements in one method - not reuse the same custom prototype for each element', () => {
            const component = mountWithCustomWrappers<NestedContainerWrapper>(TestComponent(), wrapperForNestedContainer);

            expect(component.allActiveSpansDataValues()).toEqual(['Span 1', 'Span 3']);
        });
    });

    describe('using namespaces', () => {
        type ButtonWrapper = ReturnType<typeof wrapperForTestButton>;
        type FirstSpanWrapper = ReturnType<typeof wrapperForFirstSpan>;

        const wrapperForFirstSpan = (component: Wrapper) => ({
            firstSpan: {
                dataValue: () => component.queryAllByTestId('span')[0].getAttribute('data-value')
            }
        });

        const wrapperForTestButton = (component: Wrapper) => ({
            testButton: {
                dataValue: () => component.queryByText('Test Button').getAttribute('data-value')
            }
        });

        it('should allow to create wrappers with namespaces to avoid names clashes', () => {
            type MyWrapper = FirstSpanWrapper & ButtonWrapper
            const component = mountWithCustomWrappers<MyWrapper>(TestComponent(), wrapperForFirstSpan, wrapperForTestButton);

            expect(component.firstSpan.dataValue()).toEqual('Span 1');
            expect(component.testButton.dataValue()).toEqual('Test Button');
        })
    });

    describe('withWrapper helper', () => {
        const unsupportedMethods = [
            'unmount',
            'asFragment',
            'rerender',
            'debug'
        ];

        unsupportedMethods.forEach((method) => {
            it(`should throw exception when trying to call ${method} method`, async () => {
                const component = mountWithCustomWrappers(TestComponent());

                expect(() => withinWithWrapper(component.queryByText('Test Button'))[method]()).toThrow('This operation is only supported at root element!');
            });
        });

    });
});
