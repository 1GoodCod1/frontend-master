// import React, { useState, useEffect, useRef } from 'react';
// interface LazyAvatarProps extends AvatarProps {
//   src?: string;
//   placeholder?: React.ReactNode;
//   fallback?: string;
//   loading?: 'lazy' | 'eager';
// }

// export function LazyAvatar({
//   src,
//   placeholder,
//   fallback,
//   loading = 'lazy',
//   ...props
// }: LazyAvatarProps) {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [isInView, setIsInView] = useState(loading === 'eager');
//   const [hasError, setHasError] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Intersection Observer для lazy loading
//   useEffect(() => {
//     if (loading === 'eager' || !src || !containerRef.current) {
//       setIsInView(true);
//       return;
//     }

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setIsInView(true);
//             observer.disconnect();
//           }
//         });
//       },
//       {
//         rootMargin: '100px', // Для аватаров загружаем раньше
//         threshold: 0.01,
//       }
//     );

//     observer.observe(containerRef.current);

//     return () => {
//       observer.disconnect();
//     };
//   }, [src, loading]);

//   const handleLoad = () => {
//     setIsLoaded(true);
//   };

//   const handleError = () => {
//     setHasError(true);
//   };

//   const imageSrc = hasError && fallback ? fallback : src;

//   if (!src && !props.children) {
//     return <Avatar {...props} />;
//   }

//   return (
//     <div ref={containerRef}>
//       {!isLoaded && src && (
//         <Skeleton
//           variant="circular"
//           sx={{
//             width: props.sx?.width || props.width || 40,
//             height: props.sx?.height || props.height || 40,
//             position: 'absolute',
//             zIndex: 0,
//           }}
//         />
//       )}
//       <Avatar
//         {...props}
//         src={isInView ? imageSrc : undefined}
//         imgProps={{
//           onLoad: handleLoad,
//           onError: handleError,
//           loading: loading === 'eager' ? 'eager' : 'lazy',
//         }}
//         sx={{
//           position: 'relative',
//           opacity: isLoaded || !src ? 1 : 0,
//           transition: 'opacity 0.2s ease-in-out',
//           ...props.sx,
//         }}
//       />
//     </div>
//   );
// }
