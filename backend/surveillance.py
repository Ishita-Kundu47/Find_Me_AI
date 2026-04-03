import cv2
import requests
import time
import datetime
import os

# =====================
# CONFIG
# =====================
BACKEND_URL = "http://localhost:5000/camera/match"
SCAN_INTERVAL = 10        # seconds between each scan
SAVE_CAPTURES = True      # save captured frames locally
CAPTURE_FOLDER = "captures"
SIMILARITY_THRESHOLD = 60  # alert if match above this %

os.makedirs(CAPTURE_FOLDER, exist_ok=True)

def send_frame_to_backend(frame):
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{CAPTURE_FOLDER}/capture_{timestamp}.jpg"

    # Save frame locally
    if SAVE_CAPTURES:
        cv2.imwrite(filename, frame)

    # Send to backend
    _, buffer = cv2.imencode(".jpg", frame)
    files = {"image": ("capture.jpg", buffer.tobytes(), "image/jpeg")}

    try:
        response = requests.post(BACKEND_URL, files=files, timeout=60)
        return response.json()
    except Exception as e:
        print(f"[ERROR] Failed to send frame: {e}")
        return None


def run_surveillance():
    print("=" * 50)
    print("  FindMe AI — Surveillance System")
    print("  Press Ctrl+C to stop")
    print("=" * 50)

    # Open webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("[ERROR] Cannot access camera. Check if webcam is connected.")
        return

    print("[INFO] Camera started successfully")
    print(f"[INFO] Scanning every {SCAN_INTERVAL} seconds...")

    scan_count = 0

    try:
        while True:
            ret, frame = cap.read()

            if not ret:
                print("[ERROR] Failed to capture frame")
                time.sleep(2)
                continue

            scan_count += 1
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n[SCAN #{scan_count}] {timestamp}")

            # Show live feed window
            # cv2.imshow("FindMe AI Surveillance", frame)

            # Send to backend for matching
            result = send_frame_to_backend(frame)

            if result:
                matches = result.get("matches", [])
                total = result.get("total_matches", 0)

                if total == 0:
                    print(f"[RESULT] No matches found")
                else:
                    print(f"[ALERT] {total} match(es) found!")
                    for match in matches:
                        similarity = match.get("similarity", 0)
                        name = match.get("name", "Unknown")
                        location = match.get("last_seen_location", "Unknown")
                        missing_id = match.get("missing_id")

                        print(f"  → Name: {name}")
                        print(f"  → Similarity: {similarity}%")
                        print(f"  → Last seen: {location}")
                        print(f"  → Missing ID: {missing_id}")

                        if similarity >= SIMILARITY_THRESHOLD:
                            print(f"  ⚠ HIGH CONFIDENCE MATCH DETECTED!")

            # Press Q to quit the window
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("[INFO] Quitting surveillance...")
                break

            # Wait before next scan
            time.sleep(SCAN_INTERVAL)

    except KeyboardInterrupt:
        print("\n[INFO] Surveillance stopped by user")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print(f"[INFO] Total scans completed: {scan_count}")


if __name__ == "__main__":
    run_surveillance()