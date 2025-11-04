/**
 * @param {number} i 
 * @param {number} j
 * @return {number} Returns 1 if i = j, otherwise returns 0
 */
function kroneckerDelta(i, j) {
    // if( i === j ){
    //     return 1;
    // }else{
    //     return 0;
    // }
    return i === j ? 1 : 0; //三項演算子の書き方 「条件 ? 真の場合の値 : 偽の場合の値 ; 」 (if文を省略してかける)
}