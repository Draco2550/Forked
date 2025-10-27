import os
HOME = os.getcwd()
print(HOME)


import multiprocessing
from ultralytics import YOLO


# def main():
#     model = YOLO('runs/train/exp2/weights/best.pt')
#     metrics = model.val(
#         data='Project/data.yaml',  
#         imgsz=640,
#         batch=16,
#         conf=0.25,
#         iou=0.7,
#         device=0)
#     print(metrics.box.map50)      # mAP@0.5

model = YOLO('runs/train/exp2/weights/best.pt')
img_filepath_list = ["test/24_5_raspberry - 10.jpg","test/9_3_lemon_wob_37.jpg", "test/15_6_banana_wob_38.jpg"]
results = model.predict(img_filepath_list, conf=0.7, iou=0.3)

img_class_names = set()
for result in results:
    for box in result.boxes:
        class_id = int(box.cls)
        class_name = model.names[class_id]
        img_class_names.add(class_name)
        print(f"Class ID: {class_id}, Class Name: {class_name}")



print(img_class_names)
# def main():
#     model = YOLO('G:/YOLOv8/yolo11n.pt')
#     model.train(
#         #resume=True,                # picks up optimizer & scheduler
#         data='Project/data.yaml',
#         epochs=75,                  # total epochs 
#         batch=-1, # original 16 experimental: -1
#         imgsz=640,
#         project='runs/train',
#         name='exp2',                
#         device=0
#     )

# if __name__ == '__main__':
#     multiprocessing.freeze_support()             # required on Windows
#     multiprocessing.set_start_method('spawn')     # explicit command
#     main()
# # load the YOLOv11n detection model

# results = model.predict(source='train/1_4_chilli_wob_7.jpg', conf=0.25,save=False)
# res = results[0]
# res.show()
