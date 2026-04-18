//   // STYLE THEM UPS EASTER EGG 
//   const [workHintActive, setWorkHintActive] = useState(false);

//   useEffect(() => {
//     // 40% chance the hint ever appears this visit
//     if (Math.random() > 0.4) return;

//     const minDelay = 4000;  // 4s
//     const maxDelay = 20000; // 20s

//     const delay =
//       Math.random() * (maxDelay - minDelay) + minDelay;

//     const timeout = setTimeout(() => {
//       setWorkHintActive(true);

//       // bounce only briefly
//       setTimeout(() => {
//         setWorkHintActive(false);
//       }, 1200); // bounce duration
//     }, delay);

//     return () => clearTimeout(timeout);
//   }, []);

//   // DEV: also trigger hint on "h" key press
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === 'h') {
//         setWorkHintActive(true);
//         setTimeout(() => setWorkHintActive(false), 1200);
//       }
//     };

//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, []);