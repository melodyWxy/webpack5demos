import './other'
import "./styles.css";
import "./styles.less";
import add  from '@utils/add';
import j from "$";
// console.log("hello world!2");
// console.log(add);
// console.log( 'xixi11122331112323');

const worker = new Worker(new URL('./work.js', import.meta.url));
// worker.postMessage({
//   question:
//     'The Answer to the Ultimate Question of Life, The Universe, and Everything.',
// });
// worker.onmessage = ({ data: { answer } }) => {
//   console.log(answer);
// };