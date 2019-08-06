import { out } from './src';

test('Function out should print "Hello World!"', function () {
    expect(out()).toBe('Hello World!');
});