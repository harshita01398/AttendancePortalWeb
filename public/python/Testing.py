import cv2
import numpy as np
import detectLines
import vertical
import roi
import rectangle
import sys

try:
    # img =  cv2.imread(input("Enter the name of the image : "))
    # print(img.shape)
    img = cv2.imread(sys.argv[1])
    small_img = rectangle.resize(img)

    rect_img = rectangle.draw(small_img)
    horizontal_lines = detectLines.detect(rect_img)
    vertical_lines = vertical.detect(rect_img)
    roi.create_row(rect_img,horizontal_lines,vertical_lines)

    print("Success!")
    sys.stdout.flush()
except AttributeError:
    print("Enter valid Image name")

except NoneTypeError:
    print("Error Occured .. Please Try Again")

