__author__ = 'oscarmarinmiro'

import sys,json,os

INPUT_FILE = "data_070313.json"

OUTPUT_FILE = "data_070313.json.indented"

fileIn = open(INPUT_FILE,"rb")

ref = json.load(fileIn)

fileIn.close()

fileOut = open(OUTPUT_FILE,"wb")

json.dump(ref,fileOut,indent=4)

fileOut.close()