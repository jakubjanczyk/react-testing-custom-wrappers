import {ReactElement} from 'react';
import {fireEvent, render, RenderResult, within} from '@testing-library/react';
import * as queries from '@testing-library/dom/queries';

export interface CommonWrapper {
    click: () => void;
    blur: () => void;
    focus: () => void;
    typeText: (text: string) => void;
}

export type Wrapper = CommonWrapper & RenderResult;

type WrapperFunction = (component: RenderResult) => Object;

const extendToCurrentData = (next: Object, current: RenderResult) => ({...current, ...next});

const rtlCommonWrapper = (component: HTMLElement) => ({
    click() {
        fireEvent.click(component);
    },
    focus() {
        fireEvent.focus(component);
    },
    blur() {
        fireEvent.blur(component);
    },
    typeText(text: string) {
        fireEvent.change(component, {target: {value: text}});
    }

});

const combineAllWrappers = (wrappers: WrapperFunction[], extendedComponent: RenderResult) =>
    wrappers.map(part => part(extendedComponent))
        .reduce((result: RenderResult, nextWrapper: any) => extendToCurrentData(nextWrapper, result), {});


const unsupportedMethod = <T>(): T => {
    throw new Error('This operation is only supported at root element!');
};
const unsupportedMethods = {
    container: (undefined as any),
    asFragment: () => unsupportedMethod<any>(),
    debug: () => unsupportedMethod<any>(),
    rerender: () => unsupportedMethod<any>(),
    unmount: () => unsupportedMethod<any>(),
};

export const withinWithWrapper = (el: HTMLElement): Wrapper => {
    return {
        ...unsupportedMethods,
        baseElement: el,
        ...within<typeof queries>(el),
        ...rtlCommonWrapper(el)
    };
};

export const createComponentWrapperFor = <CustomWrappers = {}>(...wrappers: WrapperFunction[]) => (component: RenderResult): CustomWrappers & RenderResult => {
    return {
        ...component,
        ...combineAllWrappers(wrappers, component)
    } as CustomWrappers & RenderResult;
};

export const mountWithCustomWrappers = <CustomWrappers = {}>(node: ReactElement<any>, ...wrappers: WrapperFunction[]): CustomWrappers & RenderResult =>
    createComponentWrapperFor<CustomWrappers>(...wrappers)(render(node));


