const GeneratorFunction = (function*(){}).constructor;

function createGeneratorMiddleware(extraArgument) {
    return ({ dispatch, getState }) => next => action => {
        if(action instanceof GeneratorFunction) {
            return (async () => {
                let generator = action(dispatch, getState, extraArgument);
                let nextValue;
                let next;
                while(!(next = generator.next(nextValue)).done) {
                    if(next.value.then) {
                        nextValue = await next.value;
                    } else {
                        nextValue = next.value;
                    }
                }
                return generator;
            })();
        }

        return next(action);
    };
}

const generatorMiddleware = createGeneratorMiddleware();
generatorMiddleware.withExtraArgument = createGeneratorMiddleware;

//testing
const mw = generatorMiddleware;
const next = () => {};

const actionG = function*() {
    const one = yield 1;
    console.log('g - one: ', one);
    const five = yield Promise.resolve(5);
    console.log('g - five: ', five);
    const hello = yield 'hello';
    console.log('g - hello: ', hello);
};

const actionN = () => {
    console.log('normal');
    return 'normal';
};

const actionP = async () => {
    await 'await';
    return 'awaited';
};

//mw({})(next)(actionG);
//mw({})(next)(actionN);
//mw({})(next)(actionP);

export default generatorMiddleware;
