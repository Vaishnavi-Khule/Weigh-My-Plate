#Area is pixel*pixel
#volume is pixel*pixel*depth(in range 0 to 2)
#Overlapping boxes ???

import os
import cv2
import torch
import urllib.request
import numpy as np
import matplotlib.pyplot as plt



import sys
import torchvision
import torch
from torchvision import transforms
from PIL import Image
import cv2
import random

import torchvision.transforms as T
import matplotlib.patches as patches


from roboflow import Roboflow


def calculating_depth(image_path, food_loc):
    # print("No coins here")
    #url, filename = ("https://github.com/pytorch/hub/raw/master/images/dog.jpg", "dog.jpg")
    #urllib.request.urlretrieve(url, filename)

    # model_type = "DPT_Large"  # MiDaS v3 - Large     (highest accuracy, slowest inference speed)
    model_type = "DPT_Hybrid"   # MiDaS v3 - Hybrid    (medium accuracy, medium inference speed)
    # model_type = "MiDaS_small"  # MiDaS v2.1 - Small   (lowest accuracy, highest inference speed)

    midas = torch.hub.load("intel-isl/MiDaS", model_type)

    device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
    midas.to(device)
    midas.eval()

    midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")

    if model_type == "DPT_Large" or model_type == "DPT_Hybrid":
        transform = midas_transforms.dpt_transform
    else:
        transform = midas_transforms.small_transform

    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    input_batch = transform(img).to(device)


    with torch.no_grad():
        prediction = midas(input_batch)

        # Reverse the order of the image shape for interpolation
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=(img.shape[1], img.shape[0]),
            mode="bicubic",
            align_corners=False,
        ).squeeze()

    output = prediction.cpu().numpy() / 1000.0
    depth_values = prediction.cpu().numpy()/1000.0

    food_items_depth = []

    # Print the maximum depth value
    max_depth = np.max(depth_values)
    #print("Maximum Depth:", max_depth)
    # print("depths for each object: ")
    for i in range(len(food_loc)):
        # print(food_loc[i][0], food_loc[i][1][0], food_loc[i][1][1])
        # print(food_loc[i][0], depth_values[int(food_loc[i][1][0])][int(food_loc[i][1][1])])
        # volume = area*depth
        volume = int(food_loc[i][1][2]) * depth_values[int(food_loc[i][1][0])][int(food_loc[i][1][1])] *0.006
        food_items_depth.append((food_loc[i][0],volume))
    # Display the depth map
    plt.imshow(output, cmap="viridis")
    plt.colorbar()
    # plt.show()
    plt.savefig('depth.jpg', bbox_inches='tight')  # Use bbox_inches='tight' to ensure the entire image is saved
    # if os.path.exists('depth.jpg'):
    #     plt.savefig('depth.jpg', bbox_inches='tight',overwrite=True)  # Use bbox_inches='tight' to ensure the entire image is saved
    # else:
    #     plt.savefig('depth.jpg', bbox_inches='tight')  # Use bbox_inches='tight' to ensure the entire image is saved
    plt.close() 
    return food_items_depth

def calculating_depth_with_coin(image_path, food_loc, coininfo):
    # print("A COIN!!!!")
    #url, filename = ("https://github.com/pytorch/hub/raw/master/images/dog.jpg", "dog.jpg")
    #urllib.request.urlretrieve(url, filename)

    # model_type = "DPT_Large"  # MiDaS v3 - Large     (highest accuracy, slowest inference speed)
    model_type = "DPT_Hybrid"   # MiDaS v3 - Hybrid    (medium accuracy, medium inference speed)
    # model_type = "MiDaS_small"  # MiDaS v2.1 - Small   (lowest accuracy, highest inference speed)

    midas = torch.hub.load("intel-isl/MiDaS", model_type)

    device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
    midas.to(device)
    midas.eval()

    midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")

    if model_type == "DPT_Large" or model_type == "DPT_Hybrid":
        transform = midas_transforms.dpt_transform
    else:
        transform = midas_transforms.small_transform

    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    input_batch = transform(img).to(device)


    with torch.no_grad():
        prediction = midas(input_batch)

        # Reverse the order of the image shape for interpolation
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=(img.shape[1], img.shape[0]),
            mode="bicubic",
            align_corners=False,
        ).squeeze()

    output = prediction.cpu().numpy() / 1000.0
    depth_values = prediction.cpu().numpy()/1000.0

    food_items_depth = []

    #calculating for coin

    # foc_len = 3.5
    # disttocoin = foc_len*coininfo[0]
    appcointhick = depth_values[int(coininfo[1][0])][int(coininfo[1][1])]
    cointhick = 1.5

    # print("appparent depth of coin: ", appcointhick)

    # depthscale = appcointhick/cointhick
    depthscale = cointhick/appcointhick
    areascale = coininfo[0]
    

    # Print the maximum depth value
    # max_depth = np.max(depth_values)
    # print("Maximum Depth:", max_depth)

    # print("depths for each object: ")
    for i in range(len(food_loc)):
        # print(food_loc[i][0], food_loc[i][1][0], food_loc[i][1][1])
        # print(food_loc[i][0], depth_values[int(food_loc[i][1][0])][int(food_loc[i][1][1])])
        # volume = area*depth
        # print("apparent depth of apple: ", depth_values[int(food_loc[i][1][0])][int(food_loc[i][1][1])])
        # print("area: ", food_loc[i][1][2] * areascale)
        # print("depth: ", depth_values[int(food_loc[i][1][0])][int(food_loc[i][1][1])] * depthscale)
        volume = food_loc[i][1][2] * areascale * depth_values[int(food_loc[i][1][0])][int(food_loc[i][1][1])] * depthscale
        food_items_depth.append((food_loc[i][0],volume))
    # Display the depth map
    plt.imshow(output, cmap="viridis")
    plt.colorbar()
    # plt.show()
    plt.savefig('depth.jpg', bbox_inches='tight')  # Use bbox_inches='tight' to ensure the entire image is saved
    # if os.path.exists('depth.jpg'):
    #     plt.savefig('depth.jpg', bbox_inches='tight',overwrite=True)  # Use bbox_inches='tight' to ensure the entire image is saved
    # else:
    #     plt.savefig('depth.jpg', bbox_inches='tight')  # Use bbox_inches='tight' to ensure the entire image is saved
    plt.close() 
    return food_items_depth

# Example usage:
#image_path = "/Users/suyash9698/desktop/Fruit_Vegetable_Recognition/train/apple/Image_1.jpg"
#calculating_depth(image_path)


#Detecting onjects using RCNN
def fastRcnnModel(image_filename):
    # Load a pre-trained Faster R-CNN model
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
    model.eval()

    # Load and preprocess the image for inference
    img = Image.open(image_filename)
    transform = T.Compose([T.ToTensor()])
    img = transform(img)

    # Run inference
    with torch.no_grad():
        predictions = model([img])

    # Process the predictions
    boxes = predictions[0]['boxes'].numpy()
    labels = predictions[0]['labels'].numpy()
    scores = predictions[0]['scores'].numpy()

    # COCO class names mapping
    coco_class_names = [
        "N/A", "person", "bicycle", "car", "motorcycle", "airplane", "bus",
        "train", "truck", "boat", "traffic light", "fire hydrant", "N/A",
        "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse",
        "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "N/A", "backpack",
        "umbrella", "N/A", "N/A", "handbag", "tie", "suitcase", "frisbee", "skis",
        "snowboard", "sports ball", "kite", "baseball bat", "baseball glove",
        "skateboard", "surfboard", "tennis racket", "bottle", "N/A", "wine glass",
        "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich",
        "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake",
        "chair", "couch", "potted plant", "bed", "N/A", "dining table", "N/A",
        "N/A", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
        "microwave", "oven", "toaster", "sink", "refrigerator", "N/A", "book",
        "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
    ]

    # Visualize the results with labels
    fig, ax = plt.subplots(1)
    ax.imshow(img.permute(1, 2, 0))

    food_objects = []
    food_loc = []
    allowed_food = ["banana", "apple", "sandwich", "orange", "broccoli", "hot dog", "pizza", "donut"]
    for box, label, score in zip(boxes, labels, scores):
        if score > 0.5 and coco_class_names[label] in allowed_food:  # Adjust the confidence threshold as needed
            x, y, x_max, y_max = box
            label_name = coco_class_names[label]
            rect = patches.Rectangle((x, y), x_max - x, y_max - y, linewidth=1, edgecolor='r', facecolor='none')
            ax.add_patch(rect)
            label_text = f"{label_name} ({score:.2f})"
            ax.annotate(label_text, (x, y), color='r')
            
            area = float((x_max - x) * (y_max - y))
            food_objects.append((label_name,area))
            xco = x+(x_max-x)/2
            yco = y+(y_max-y)/2
            food_loc.append((label_name, (xco, yco, area, x_max-x, y_max-y)))

    # print(food_objects)
    # plt.show()
    plt.savefig('rcnnDetetion.jpg', bbox_inches='tight')  # Use bbox_inches='tight' to ensure the entire image is saved

    # if os.path.exists('rcnnDetetion.jpg'):
    #     plt.savefig('rcnnDetetion.jpg', bbox_inches='tight',overwrite=True)  # Use bbox_inches='tight' to ensure the entire image is saved
    # else:
    #     plt.savefig('rcnnDetetion.jpg', bbox_inches='tight')  # Use bbox_inches='tight' to ensure the entire image is saved
    
    plt.close() 
    return food_loc


#Custom model using roboflow
def customModel(image_filename):
    image = cv2.imread(image_filename)

    from roboflow import Roboflow
    rf = Roboflow(api_key="m2NiXs4UfyGH5TVefHS3")
    project = rf.workspace().project("food-detection-final-1gp6h")
    model = project.version(2).model

    # rf = Roboflow(api_key="5VVNcxreBMajuyk579Ry")
    # project1 = rf.workspace().project("coin-detection-d4rej")
    # model1 = project.version(1).model

    # infer on a local image
    detection_output = model.predict(image_filename, confidence=40, overlap=30).json()
    # print(model.predict(image_filename, confidence=40, overlap=30).json())

# visualize your prediction
# model.predict("your_image.jpg", confidence=40, overlap=30).save("prediction.jpg")

# infer on an image hosted elsewhere
# print(model.predict("URL_OF_YOUR_IMAGE", hosted=True, confidence=40, overlap=30).json())

    # Extracting bounding box coordinates and dimensions
    food_loc = []
    for i in range(len(detection_output['predictions'])):
        if detection_output['predictions'][i]['class']=="jalebi":
            continue
        bbox = detection_output['predictions'][i]
        x_mid, y_mid, width, height = int(bbox['x']), int(bbox['y']), int(bbox['width']), int(bbox['height'])

        x = int(x_mid - width / 2)
        y = int(y_mid - height / 2)
        area = width*height
        food_loc.append((bbox['class'], (x_mid, y_mid, area, width, height)))
        # Draw bounding box on the image
        cv2.rectangle(image, (x, y), (x + width, y + height), (0, 255, 0), 2)  # Green rectangle
        label = bbox['class']
        cv2.putText(image, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255, 0, 0), 2)  # Text above the rectangle

    cv2.imwrite("customDetection.jpg", image)
    return food_loc


#Coin detection
def coinDetection(image_filename):
    image = cv2.imread(image_filename)

    from roboflow import Roboflow
    rf = Roboflow(api_key="5VVNcxreBMajuyk579Ry")
    project = rf.workspace().project("coin-detection-d4rej")
    model = project.version(2).model

    # rf = Roboflow(api_key="5VVNcxreBMajuyk579Ry")
    # project1 = rf.workspace().project("coin-detection-d4rej")
    # model1 = project.version(1).model

    # infer on a local image
    detection_output = model.predict(image_filename, confidence=40, overlap=30).json()
    # print("this is coin: ")
    # print(model.predict(image_filename, confidence=40, overlap=30).json())
    radius = 0
    maxcon = 0
    flag=True
    for i in range(len(detection_output['predictions'])):
        if maxcon<detection_output['predictions'][i]['confidence']:
            if abs(detection_output['predictions'][i]['width']-detection_output['predictions'][i]['height'])<100:
                flag = False
                radius = (detection_output['predictions'][0]['width']+detection_output['predictions'][0]['height'])/4
                maxcon = detection_output['predictions'][i]['confidence']
                bbox = detection_output['predictions'][i]
                x_mid, y_mid, width, height = int(bbox['x']), int(bbox['y']), int(bbox['width']), int(bbox['height'])
                
                x = int(x_mid - width / 2)
                y = int(y_mid - height / 2)
                # Draw bounding box on the image
                cv2.rectangle(image, (x, y), (x + width, y + height), (0, 255, 0), 2)  # Green rectangle
                label = bbox['class']
                cv2.putText(image, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255, 0, 0), 2)  # Text above the rectangle
            else:
                detection_output['predictions'].pop(i)
            

    cv2.imwrite("coinDetection.jpg", image)
    
    if flag:
        return []
    app_area = 3.14*radius*radius
    act_area = 4.9 #cm2
    foc_len = 35
    pixtoact = act_area/app_area
    # obj_dist = foc_len*pixtoact
    # print(obj_dist)

    coininfo = [pixtoact, (x_mid,y_mid)]
    return coininfo
    # visualize your prediction
    # model.predict("your_image.jpg", confidence=40, overlap=30).save("prediction.jpg")

    # infer on an image hosted elsewhere
    # print(model.predict("URL_OF_YOUR_IMAGE", hosted=True, confidence=40, overlap=30).json())

#removing overlaps

def mergeboxes(food_loc_custom, food_loc_rcnn):
    temp_rcnn = food_loc_rcnn.copy()
    temp_custom = food_loc_custom.copy()
    for i in range(len(food_loc_rcnn)):
        for j in range(len(food_loc_custom)):
            if food_loc_custom[j][1][1]-food_loc_custom[j][1][4]/2<food_loc_rcnn[i][1][1] and food_loc_rcnn[i][1][1]<food_loc_custom[j][1][1]+food_loc_custom[j][1][4]/2:
                if food_loc_custom[j][1][0]-food_loc_custom[j][1][3]/2<food_loc_rcnn[i][1][0] and food_loc_rcnn[i][1][0]<food_loc_custom[j][1][0]+food_loc_custom[j][1][3]/2:
                    if abs(food_loc_custom[j][1][2]-food_loc_rcnn[i][1][2])<food_loc_custom[j][1][2]*0.35:
                        if food_loc_rcnn[i][0]=="apple":
                            temp_custom.remove(food_loc_custom[j])
                        else:
                            temp_rcnn.remove(food_loc_rcnn[i])
    return (temp_custom, temp_rcnn)
#Main function
if __name__ == "__main__":
    
    if len(sys.argv) != 2:
        print("Usage: python script1.py <image_filename>")
        sys.exit(1)

    image_filename = sys.argv[1]

    #Calling rcnn
    food_loc_rcnn = []
    food_loc_rcnn = fastRcnnModel(image_filename)

    #Calling custom
    food_loc_custom = []
    food_loc_custom = customModel(image_filename)

    food_loc = []

    food_loc_custom,food_loc_rcnn = mergeboxes(food_loc_custom, food_loc_rcnn)
    # mergeboxes(food_loc_custom, food_loc_rcnn)
    
    food_loc.extend(food_loc_rcnn)
    food_loc.extend(food_loc_custom)


    # print(food_loc)
    # exit()
    coininfo = coinDetection(image_filename)
    # print("depth start")
    if len(coininfo) == 0:
        food_items_depth = calculating_depth(image_filename, food_loc)
    else:
        food_items_depth = calculating_depth_with_coin(image_filename, food_loc, coininfo)

    print(food_items_depth)

