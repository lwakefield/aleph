import {h, Component, render } from 'preact'
import {spy, mock, stub} from 'sinon'

import give from 'give'

afterEach(() => give.__ResetDependency__('Stores'))

test('give() creates a Connector', () => {
    @give()
    class Foo extends Component { }

    expect(Foo.prototype.constructor.name).toEqual('Connector')
    expect(Foo.prototype.__connect).toBeDefined()
    expect(Foo.prototype.__disconnect).toBeDefined()
})

test('Connector instantiates correctly', () => {
    const fn = stub().returns({foo: 'bar', baz: 'qux'})

    @give(fn)
    class Foo extends Component { }
    spy(Foo.prototype, '__connect')

    const inst = new Foo()

    expect(inst).toMatchSnapshot()
    expect(fn.callCount).toEqual(1)
    expect(inst.__connect.callCount).toEqual(2)
    expect(inst.__connect.calledWith('foo', 'bar')).toBeTruthy()
    expect(inst.__connect.calledWith('baz', 'qux')).toBeTruthy()
})

test('Connector.__connect works correctly', () => {
    @give(() => ({}))
    class Foo extends Component { }

    const inst = new Foo()
    spy(inst, 'setState')
    const Stores = {
        on: stub(),
        get: stub().returns('hello world')
    }
    give.__Rewire__('Stores', Stores)

    inst.__connect('foo', 'bar')
    expect(inst.setState.calledOnce).toBeTruthy()
    expect(inst.setState.calledWith({foo: 'hello world'})).toBeTruthy()
    expect(Stores.on.calledOnce)
    expect(Stores.on.getCall(0).args[0]).toEqual('bar')
    expect(Stores.on.getCall(0).args[1]).toBeInstanceOf(Function)
    expect(inst.__listeners.get('bar')).toBeInstanceOf(Function)
})

test('Connector.__disconnect works correctly', () => {
    @give(() => ({}))
    class Foo extends Component { }

    const inst = new Foo()
    const fn = stub()
    inst.__listeners.set('foo', fn)
    const Stores = {
        off: stub(),
        get: stub().returns('hello world')
    }
    give.__Rewire__('Stores', Stores)

    inst.__disconnect('foo')
    expect(Stores.off.calledOnce)
    expect(Stores.off.calledWith('foo', fn)).toBeTruthy()
    expect(inst.__listeners.get('foo')).toBeUndefined()
})

test('Connector.componentDidUpdate works correctly', () => {
    // will pass through props
    @give(v => v)
    class Foo extends Component { }

    const inst = new Foo({
        foo: 'bar',
        baz: 'qux',
    })
    inst.props = {
        foo: 'bar1',
        baz: 'qux'
    }
    spy(inst, '__disconnect')
    spy(inst, '__connect')

    // should update foo, but leave baz alone
    inst.componentDidUpdate()
    expect(inst.propMap).toEqual({foo: 'bar1', baz: 'qux'})
    expect(inst.__disconnect.calledOnce).toBeTruthy()
    expect(inst.__disconnect.calledWith('bar')).toBeTruthy()
    expect(inst.__connect.calledOnce).toBeTruthy()
    expect(inst.__connect.calledWith('foo', 'bar1')).toBeTruthy()
})

test('Connector.render works correctly', () => {
    @give(() => ({}))
    class Foo extends Component { }

    const inst = new Foo()
    const rendered = inst.render({foo: 'bar'}, {baz: 'qux'})
    expect(rendered).toMatchSnapshot()
})

test('Connector.render renders to document', () => {
    @give(() => ({
        foo: 'this is my foo',
        bar: 'this is my bar',
    }))
    class Foo extends Component {
        render ({foo, bar}) {
            return <p>my foo: {foo}, mybar: {bar}</p>
        }
    }

    const Stores = {
        on: stub(),
        off: stub(),
        get: v => v
    }
    give.__Rewire__('Stores', Stores)

    render(<Foo />, document.body)
    expect(document.body.innerHTML).toMatchSnapshot()
})

test('Connector receives updates from Stores', () => {
    const data = {bar: 'hello from bar'}
    const listeners = {}
    const Stores = {
        on: (k, v) => listeners[k] = v,
        get: k => data[k]
    }
    give.__Rewire__('Stores', Stores)

    @give(() => ({'foo': 'bar'}))
    class Foo extends Component { }

    const inst = new Foo()
    expect(inst.state).toEqual({foo: 'hello from bar'})
    data.bar = 'hello again from bar'
    listeners.bar()
    expect(inst.state).toEqual({foo: 'hello again from bar'})
})
