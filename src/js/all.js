const people = {
    name: 'Roya',
    height: 170,
  };

/* --- 箭頭函式、ES6 變數、ES6 陣列方法 --- */
let color = [1, 2, 3, 4, 5];
let result = color.filter((item) => item > 2);

/* --- Class 語法糖 --- */
class Circle {}

/* --- Promise 物件 --- */
const promise = Promise.resolve();

// 引用 gulp-imagemin
import imagemin from 'gulp-imagemin';

export default () => (
	gulp.src('src/img/*')
		.pipe(imagemin())
		.pipe(gulp.dest('public/images'))
);