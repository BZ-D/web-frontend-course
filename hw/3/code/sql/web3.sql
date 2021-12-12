/*
 Navicat MySQL Data Transfer

 Source Server         : 127.0.0.1
 Source Server Version : 50621
 Source Host           : localhost
 Source Database       : web3

 Target Server Version : 50621
 File Encoding         : utf-8

*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
                            `uid` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                            `email` varchar(32) NOT NULL,
                            `display_name` varchar(20) NOT NULL,
                            `signup_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            `role` varchar(10) NOT NULL DEFAULT 'user'
) CHARSET=utf8;


-- ----------------------------
--  Table structure for `user_auth`
-- ----------------------------
DROP TABLE IF EXISTS `user_auth`;
CREATE TABLE `user_auth` (
                         `auth_id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                         `uid` int(11) NOT NULL,
                         `passwd` varchar(255) NOT NULL,
                         `salt` varchar(255) NOT NULL,
                         FOREIGN KEY (uid) REFERENCES users (uid)
) CHARSET=utf8;


SET FOREIGN_KEY_CHECKS = 1;
