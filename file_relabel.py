import os

def change_class_id_in_folder(input_folder, output_folder, old_id, new_id):
    """
    Replace the first column (class id) in YOLO label format with a new id,
    across all .txt files in a folder. Only changes lines where the class id
    fully matches old_id.
    
    Args:
        input_folder (str): Path to folder containing YOLO label files.
        output_folder (str): Path to folder where updated files will be saved.
        old_id (int): The class id you want to replace.
        new_id (int): The new class id to use.
    """
    os.makedirs(output_folder, exist_ok=True)

    for filename in os.listdir(input_folder):
        if filename.endswith(".txt"):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)

            updated_lines = []
            with open(input_path, "r") as f:
                for line in f:
                    parts = line.strip().split()
                    if not parts:
                        continue
                    # Only change if the first column fully matches old_id
                    if parts[0].isdigit() and int(parts[0]) == old_id:
                        parts[0] = str(new_id)
                    updated_lines.append(" ".join(parts))

            with open(output_path, "w") as f:
                f.write("\n".join(updated_lines))

            print(f"Processed {filename} → saved to {output_path}")


# Example usage:
if __name__ == "__main__":
    input_folder = "G:/YOLOv8/Project/found-model/old_labels"              # folder with original YOLO label files
    output_folder = "G:/YOLOv8/Project/found-model/labels_updated"     # folder to save modified files
    old_id = 9                          # the current class id you want to replace
    new_id = 75                           # the new class id

    change_class_id_in_folder(input_folder, output_folder, old_id, new_id)
