#!/bin/bash

echo "PostgreSQL設定スクリプト"
echo "=========================="

# PostgreSQLを停止
sudo service postgresql stop

# pg_hba.confを一時的にtrustに変更
sudo sed -i 's/local   all             postgres                                peer/local   all             postgres                                trust/' /etc/postgresql/13/main/pg_hba.conf

# PostgreSQLを開始
sudo service postgresql start

# パスワードを設定
psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"

# データベースを作成
psql -U postgres -c "CREATE DATABASE interview_system;"

# pg_hba.confを元に戻す
sudo sed -i 's/local   all             postgres                                trust/local   all             postgres                                md5/' /etc/postgresql/13/main/pg_hba.conf

# PostgreSQLを再起動
sudo service postgresql restart

echo "設定完了！"
echo "接続テスト:"
PGPASSWORD=postgres psql -U postgres -h localhost -d interview_system -c "SELECT version();"