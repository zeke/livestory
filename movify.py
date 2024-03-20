import os
import subprocess


def sort_files_by_date(directory):
    files = os.listdir(directory)
    files.sort(key=lambda x: os.path.getmtime(os.path.join(directory, x)))
    return files


def convert_images_to_video(directory, output_file="output.mp4", framerate=16):
    sorted_files = sort_files_by_date(directory)
    with open("file_list.txt", "w") as file:
        for filename in sorted_files:
            if filename.endswith(".jpg"):
                file_path = os.path.join(directory, filename)
                file.write(f"file '{file_path}'\n")
                file.write(f"duration {1/framerate}\n")

    subprocess.run(
        [
            "ffmpeg",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            "file_list.txt",
            "-vsync",
            "vfr",
            "-pix_fmt",
            "yuv420p",
            output_file,
        ]
    )
    os.remove("file_list.txt")


convert_images_to_video("./output")
