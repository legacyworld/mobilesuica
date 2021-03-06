user  nginx;
worker_processes  1;
error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;
events {
  worker_connections  1024;
}

http {
  client_body_temp_path /usr/share/nginx/html;
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
  access_log  /var/log/nginx/access.log  main;
  sendfile        on;
  keepalive_timeout  65;
  upstream app {
    server app:3031;
  }
  server{
    listen 80;
    server_name localhost;
    location / {
      root   /usr/share/nginx/html;
      index  index.html index.htm;
    }
    send_timeout 600;
    proxy_connect_timeout 600;
    proxy_read_timeout    600;
    proxy_send_timeout    600;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    location /api/v1/ {
      proxy_request_buffering off;
      include uwsgi_params;
      uwsgi_pass app;
    }
    location ^~ /.well-known/acme-challenge/ {
      root /usr/share/nginx/challenge;
    }
  }
}


