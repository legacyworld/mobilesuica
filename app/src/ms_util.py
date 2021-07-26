import os
import sys
import tabula
import PyPDF2
import traceback
import pandas as pd

class ConvertError(Exception):
    pass

def convertPDFToDataFrame(requestForm,UPLOAD_SAVE_DIR):
    try:
        # dataFrameに配列を入れて送ることが出来ない
        dfList = []
        fileList = []
        for item in requestForm:
            if item != 'uuid':
                fileList.append(requestForm[item])
        fileName = ''
        uuid = requestForm['uuid']
        for fileName in fileList:
            fileNameWithUuid = uuid + '_' + fileName
            filePath = os.path.join(UPLOAD_SAVE_DIR,fileNameWithUuid)
            with open(filePath,'rb') as f:
                pageNum = PyPDF2.PdfFileReader(f).getNumPages()
                df = tabula.read_pdf(filePath,pages='all',pandas_options={'dtype':'object'})
                if df[0].columns.values.tolist():
                    for i in range(len(df)):
                        dfList.append(df[i])
                    print(f"{fileName}は正しく処理できました")
        
        d = pd.concat(dfList,ignore_index=True)
        return d
        
    except PyPDF2.utils.PdfReadError as e:
        # Show traceback
        # https://vaaaaaanquish.hatenablog.com/entry/2017/12/14/183225
        traceback.print_exc() 
        errorText =  f"ERROR: {e}\n{fileName}はPDFではなさそうです"
        print(errorText)
        raise ConvertError(errorText)
    except IndexError as e:
        traceback.print_exc()
        errorText = f"ERROR: {e}\n{fileName}はPDFですがモバイルSuicaのPDFではなさそうです"
        print(errorText)
        raise ConvertError(errorText)
    except Exception as e:
        traceback.print_exc()  
        errorText = f"ERROR: {e}\n{fileName}はなにかおかしい"
        print(errorText)
        raise ConvertError(errorText)
    finally:
        for fileName in fileList:
            fileNameWithUuid = uuid + '_' + fileName
            filePath = os.path.join(UPLOAD_SAVE_DIR,fileNameWithUuid)
            os.remove(filePath)  
