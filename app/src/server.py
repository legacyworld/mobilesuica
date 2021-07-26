import pandas as pd
import os
import shutil
import copy
import traceback
from flask import Flask, jsonify, request, make_response,send_from_directory
import ms_util

app = Flask('pdf creator')
UPLOAD_SAVE_DIR = '/tmp/'

@app.route('/api/v1/data/',methods=['POST'])
def convert_to_list():
    try:
        pd.set_option('display.max_rows', None)
        requestForm = copy.deepcopy(request.form)
        df = ms_util.convertPDFToDataFrame(requestForm,UPLOAD_SAVE_DIR)
        df.insert(0,'dummy','0')

        df.fillna('',inplace=True)
        dummy = df['dummy']
        for i in range(len(dummy)):
            dummy[i] = i
        
        tmp = df['種別'].unique().tolist()
        tmp.extend(df['種別.1'].unique().tolist())
        unique = list(set(tmp))
        unique.remove('')
        d = {'data':df.values.tolist(),'unique':unique}
    except ms_util.ConvertError as e:
        return jsonify({'error':str(e)}),500
    except Exception as e:
        traceback.print_exc()
        print('ERROR',e)
        return jsonify({'error':'something wrong'}),500
    else:
        return jsonify(d),200

@app.route('/api/v1/test/',methods=['POST'])
def test():

        df = pd.read_csv('a.txt',sep=',')
        df.insert(0,'dummy','0')

        df.fillna('',inplace=True)
        dummy = df['dummy']
        for i in range(len(dummy)):
            dummy[i] = i

        unique = df['種別'].unique().tolist()
        unique.extend(df['種別.1'].unique().tolist())
        unique.remove('')
        d = {'data':df.values.tolist(),'unique':unique}
        return jsonify(d),200

@app.route('/api/v1/upload/',methods=['POST'])
def upload():
    uuid = request.form['uuid']
    file_name = request.form['file_name']
    file = request.files[file_name]

    file_name = uuid+'_'+file_name
    file.save(os.path.join(UPLOAD_SAVE_DIR,file_name))
    return jsonify({}),200
#
# util
#


@app.errorhandler(404)
def api_not_found_error(error):
    """General 404 error."""
    return (jsonify({'error': "api not found", 'code': 404}), 404)


@app.errorhandler(405)
def method_not_allowed_error(error):
    """General 405 error."""
    return (jsonify({'error': 'method not allowed', 'code': 405}), 405)


@app.errorhandler(500)
def internal_server_error(error):
    """General 500 error."""
    return (jsonify({'error': 'server internal error', 'code': 500}), 500)


if __name__ == '__main__':
    #app.run(debug=DEBUG, host='0.0.0.0', port=PORT)
    #app.run(debug='true', host='0.0.0.0', port=8080)
    app.run()