
// Simple verification of JSON.stringify behavior
const body = {
    model: undefined,
    other: "value"
};
console.log('Body with undefined model:', JSON.stringify(body));

const body2 = {
    model: "gpt-4o",
    other: "value"
};
console.log('Body with string model:', JSON.stringify(body2));
