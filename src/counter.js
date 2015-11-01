export default function counter(initial = 0) {
  let val = initial;
  let last;
  return {
    next() {
      last = val;
      return val++;
    },
    last() {
      return last;
    },
  };
}
