const {calculateTip, FtoC, CtoF, add} = require("../src/math");

//test() is defined by jest
test('calculate total with tip', () => {
    const total = calculateTip(10, .3);

    expect(total).toBe(13);

    // if(total !== 13)
    // {
    //     throw new Error('total tip should be thirteen. Total is ' + total);
    // }
}); 

test('calculate total with default tip', () => {
    const total = calculateTip(10);

    expect(total).toBe(12.5);
});

test('conver 32f to 0 c', () => {
    const temp = FtoC(32);
    expect(temp).toBe(0);
});

test('convert 0c to 32f', () => {
    const temp = CtoF(0);
    expect(temp).toBe(32);
});

// test('async test demo', (done) => {
//     setTimeout(() => {
//         expect(1).toBe(2);
//         done();
//     }, 2000);
   
// });

test('should add 2 numbers', (done) => {
    add(2,3).then((sum) => {
        expect(sum).toBe(5);
        done();
    });
});

test('should add 2 numbers w/ async await', async() => {
    const sum = await add(10,22);
    expect(sum).toBe(32);
})
