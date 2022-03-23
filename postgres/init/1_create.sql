/* DATABASEを作成 */
CREATE DATABASE nicolist;

\c nicolist

create table tableDB(mylistName varchar(100) primary key,tableName varchar(100),mylistCount int);
