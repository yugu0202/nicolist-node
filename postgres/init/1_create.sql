/* DATABASEを作成 */
CREATE DATABASE nicolist;

\c nicolist

create table mylist(ID int primary key,name text);
create table registered(movieID int primary key,title text,tableName text,mylistID int,num int,foreign key (mylistID) references mylist(ID) on delete cascade on update cascade);
create table remove(movieID int primary key,reason text);
