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


def estimate_volume_in_cubic_meters(x1, x2, y1, y2, depth_meter):
    """
    Estimate the volume of a rectangular prism within a bounding box.

    Parameters:
    - x1, x2, y1, y2: Bounding box coordinates in pixels
    - depth_meter: Depth of the object in meters

    Returns:
    - volume_cubic_meter: Estimated volume in cubic meters
    """
    # Calculate the area of the base in square pixels
    area_of_base_pixel2 = (x2 - x1) * (y2 - y1)


    # Convert the area of the base to square meters
    area_of_base_meter2 = area_of_base_pixel2 * (depth_meter / (y2 - y1))  # Assuming y2 represents the height of the object

    # Estimate the volume in cubic meters
    volume_cubic_meter = area_of_base_meter2 * depth_meter

    return volume_cubic_meter


def calculating_depth(image_path, food_loc):
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
    depth_values = prediction.cpu().numpy()

    # Print the maximum depth value
    max_depth = np.max(depth_values)
    #print("Maximum Depth:", max_depth)
    print("depths for each object: ")
    for i in range(len(food_loc)):
        # print(food_loc[i][0], food_loc[i][1][0], food_loc[i][1][1])
        print(food_loc[i][0], depth_values[int(food_loc[i][1][0])][int(food_loc[i][1][1])])
    # Display the depth map
    plt.imshow(output, cmap="viridis")
    plt.colorbar()
    plt.show()
    return max_depth

# Example usage:
#image_path = "/Users/suyash9698/desktop/Fruit_Vegetable_Recognition/train/apple/Image_1.jpg"
#calculating_depth(image_path)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script1.py <image_filename>")
        sys.exit(1)

    image_filename = sys.argv[1]

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
    for box, label, score in zip(boxes, labels, scores):
        if score > 0.5:  # Adjust the confidence threshold as needed
            x, y, x_max, y_max = box
            label_name = coco_class_names[label]
            rect = patches.Rectangle((x, y), x_max - x, y_max - y, linewidth=1, edgecolor='r', facecolor='none')
            ax.add_patch(rect)
            label_text = f"{label_name} ({score:.2f})"
            ax.annotate(label_text, (x, y), color='r')
            
            area = (x_max - x) * (y_max - y)
            food_objects.append((label_name,area))
            xco = x+(x_max-x)/2
            yco = y+(y_max-y)/2
            food_loc.append((label_name, (xco, yco)))

    print(food_objects)
    plt.show()

    print("depth start")
    calculating_depth(image_filename, food_loc)