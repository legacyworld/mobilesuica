FROM centos:7
USER root
RUN yum -y update
RUN yum -y install java-1.8.0-openjdk
RUN yum -y install readline-devel zlib-devel bzip2-devel sqlite-devel openssl-devel \
    libXext.x86_64 libSM.x86_64 libXrender.x86_64 gcc gcc-c++ libffi-devel python-devel git
RUN yum install -y https://repo.ius.io/ius-release-el7.rpm
RUN yum install -y python36u python36u-devel python36u-libs python36u-pip
RUN pip3 install flask pandas tabula-py PyPDF2 uwsgi
# 日本語環境
# https://qiita.com/YuukiMiyoshi/items/f389ea366060537b5cd9
RUN localedef -f UTF-8 -i ja_JP ja_JP.UTF-8
ENV LANG="ja_JP.UTF-8" \
    LANGUAGE="ja_JP:ja" \
    LC_ALL="ja_JP.UTF-8"
COPY ./src /src
WORKDIR /src
ENV PORT=80
ENV DEBUG=False
ENV PYTHONUNBUFFERED=1
RUN useradd -r -s /bin/false uwsgiusr
USER uwsgiusr
#ENTRYPOINT ["python", "-u", "server.py"]
CMD ["uwsgi","--ini","/src/uwsgi.ini"]
