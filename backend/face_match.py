def compare_faces(img1_path, img2_path):
    try:
        from deepface import DeepFace
        result = DeepFace.verify(
            img1_path,
            img2_path,
            enforce_detection=False
        )
        
        return {
            "match": result["verified"],
            "distance": result["distance"]
        }
    
    except Exception as e:
        return {
            "match": False,
            "error": str(e)
        }