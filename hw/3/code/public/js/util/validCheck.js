function isValidEmail(value){
  // 正则验证格式，邮箱最大为32位
  const reg = /(?=([a-zA-Z0-9._\-]{2,}@[a-zA-Z0-9_\-]{2,}(\.[a-zA-Z0-9_\-]+)+))^\S{6,32}$/
  return reg.test(value)
}


function isValidPasswd(value) {
  // 验证密码是否符合规范：字母、数字、符号两种及以上组合，8-20个字符
  // (?=.*\d)(?=.*\D) - 匹配数字和字母/符号的组合
  // (?=.*[a-zA-Z])(?=.*[^a-zA-Z]) - 匹配字母和数字/字符的组合
  // \d: 数字  \D: 非数字字符  \u4E00-\u9FA5: 汉字
  // 英文点 ".": 匹配除换行符之外的任意字符
  const reg = /((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))(?!^.*[\u4E00-\u9FA5].*$)^\S{8,20}$/
  return reg.test(value)
}

/**
 * 密码强度评定规则
 * 十个以上字符 +1
 * 大写字母与小写字母混合 +1
 * 含有至少一个数字 +1
 * 含有至少一个特殊字符 +1
 * 0/1/2分：弱
 * 3分：中
 * 4分：强
 */
function checkPasswdStrength(value) {
  let _strength = 0
  // 十二个以上字符
  const twelve_chars_reg = /^.{10,}$/
  // 同时包含大小写字母
  const lower_upper_reg = /(?=.*[a-z])(?=.*[A-Z])^\S*$/
  // 至少含有一个数字
  const digital_reg = /(?=.*[0-9])^\S*$/
  // 至少含有一个特殊字符
  const other_char_reg = /(?=.*[^0-9a-zA-Z])^\S*$/

  _strength += twelve_chars_reg.test(value)
  _strength += lower_upper_reg.test(value)
  _strength += digital_reg.test(value)
  _strength += other_char_reg.test(value)

  return _strength

}

function isValidName(value) {
  // 验证密码是否符合规范：中文、英文、数字、下划线组合，4-20个字符
  // \d: 数字  \D: 非数字字符  \u4E00-\u9FA5: 汉字
  // 英文点 ".": 匹配除换行符之外的任意字符
  const reg = /((?=.*\d)|(?=.*[a-zA-Z])|(?=.*[\u4E00-\u9FA5])|(?=.*_))^\S{4,20}$/
  return reg.test(value)
}
