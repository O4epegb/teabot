/**
 * Получаем склонение слова в зависимости от числа
 * @param  {number} num     число существительного, которое нужно склонить
 * @param  {array<strings>} words массив из 3х слов в нужных падежах, например [ 'ноль яблок', 'одно яблоко', 'два яблока' ]
 * @return {string}         окончательное склоненное слово
 */
function getDeclension(num, words) {
    var word = '';

    num = Math.abs(num);

    if (num.toString().indexOf('.') > -1) {
        word = words[2];
    } else {
        word = (num % 10 === 1 && num % 100 !== 11 ? words[1] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? words[2] : words[0]);
    }

    return word;
};

module.exports = {
    getDeclension
};
