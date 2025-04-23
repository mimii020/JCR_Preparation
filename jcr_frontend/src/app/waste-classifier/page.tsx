"use client"

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Image as ImageIcon } from 'lucide-react';
import { Detection } from './interfaces';


function Page() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setDetections([])
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', selectedImage as File);

    const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
      console.log('Image uploaded successfully');
      const data: Detection[] = await response.json();
      setDetections(data);
      console.log('Detections:', data[0]);   
    } else {
      const text = await response.text();
      console.error('Upload failed:', response.status, text);  
      console.error('Error uploading image');
    }
  };

  useEffect(() => {
    if (!selectedImage || !canvasRef.current) return;
    const imgEl = new Image();
    imgEl.src = URL.createObjectURL(selectedImage);
    imgEl.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = imgEl.width;
      canvas.height = imgEl.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(imgEl, 0, 0);
      detections?.forEach(det => {
        const [x1, y1, x2, y2] = det.bbox;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'lime';
        ctx.fillStyle = 'lime';
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.font = '18px sans-serif';
        ctx.fillText(
          `${det.className} (${(det.confidence*100).toFixed(0)}%)`,
          x1,
          y1 - 5
        );
      });
    };
  }, [selectedImage, detections]);

  return (
    <div className="w-screen h-screen p-36 flex flex-col">
        <div className="flex justify-between mb-14">
            <h1 className="text-9xl font-bold">
                Waste Recylcing
            </h1>
            <form onSubmit={handleSubmit}>
                <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
                <Button className="bg-green-600 hover:bg-green-600/40 text-white text-6xl rounded-full p-14">Upload Image</Button>
            </form>
        </div>
        <Card className="flex flex-col items-center p-14 w-1/2 ml-auto mr-auto h-2/3 bg-gray-100 border-0 rounded-3xl mt-56 shadow-md">
            <ImageIcon color="green" size={400}/>
            <p className="text-8xl">Uploaded Image will appear here</p>
        </Card>
        <canvas ref={canvasRef} style={{ marginTop: 20 }} />
    </div>
  )
}

export default Page