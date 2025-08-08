---
title: "Part 2: ShearNet's Progress"
date: "2025-08-07"
tags: "Research, Astrophysics"
snippet: "My past and current work on ShearNet."
---

# What Have I Actually Done?

If you read "Part 1: My Main Research", then you may be wondering what I've contributed to the project.  
Since Dr. Sayan is *VERY* busy in preparation for SuperBIT's data collection (see [Shaaban et. al.](https://arxiv.org/abs/2210.09182) and [McCleary et. al.](Lensing in the Blue II: Estimating the Sensitivity of Stratospheric Balloons to Weak Gravitational Lensing) for context), I have been the primary developer for ShearNet over this summer. I have been havig a blast learning so much new stuff, but let's get on to what I've implemented.  

## Model Architectures

The first step was to research and improve the CNN model's architecture. This is a rapidly expanding field of computer science that seems very daunting at first, but with some time I think it's a very cool thing to learn.  

My first improvements came from multi-scale pattern detection. In model architecture there is something called a **kernel** which is a difficult concept to understand mathematically, but abstractly a kernel is like a tiny pattern-recognition stamp that slides across an image asking "Do I see my specific pattern here?"  Originally the kernel was very small, so I changed it to have three kernels per layer, concatenateing the results. This drastically enhanced the performance, the CNN to functionally "see the bigger picture".  

My next big improvement was what I call the research-backed model. This model has a citation for every single line of code. This research-backed model sports:  
- Multi-scale processing: Inspired by galaxy morphology having features at different scales also loosely inspired by ["Inception-v4, Inception-ResNet and the Impact of Residual Connections on Learning" (Szegedy et al., 2017)](https://arxiv.org/pdf/1602.07261)
- Residual learning: ["Deep Residual Learning for Image Recognition" (He et al., CVPR 2016)](https://arxiv.org/pdf/1512.03385)
- Attention mechanisms: ["CBAM: Convolutional Block Attention Module" (Woo et al., ECCV 2018)](https://arxiv.org/pdf/1807.06521)
- Batch Normalization: ["Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift" (Ioffe & Szegedy, ICML 2015)](https://arxiv.org/pdf/1502.03167)

With all this fancy tech I achieved a very sizable increase in performance.  

## Training and Fundamental Architecture

The most recent improvement I have made follows the work of [forklens](https://arxiv.org/pdf/2301.02986). To do this I had to add PSF images into the training data. Forklens' primary advance is that we now parrallel process galaxy and psf images through separate CNNs, concatenating the features just before the final dense layers. This results in a physics-informed model, basically it understands what is blurring the image.
In this advance, I also added a model straight from the [forklens repo](https://github.com/zhangzzk/forklens) for psf processing, since it performed better than models in ShearNet on the task of learning psf.

## PSF Shear

Very recently I introduce shear into our simulated psf. This is far from an improvement to the performance of ShearNet, but it is a step toward realistic galaxy and psf images. 
This change did decrease the performance of the model slightly.  

# What Will I Do?

In the future I plan to add **metacalibration** (see ["Practical Weak-lensing Shear Measurement with Metacalibration" by Erin S. Sheldon and Eric M. Huff](https://arxiv.org/pdf/1702.02601)) to the pipeline!   

This is a very complex task. I will need to tackle three huge hurdles:

- Deconvolution: make a nueral net that deconvolves the galaxy images to get clean galaxy images
- Differentiable Shearing: apply shear transformations in a way that maintains gradients through coordinate transformations
- Neural Metacalibrator: implement the response measurement and calibration correction components of metacalibration using neural networks

This won't be easy, but I have high hopes for *really* good results afterward!

# Conclusion

I am really excited to keep working on this project into my junior year of college, I am really passionate about this work and the work adjacent to it. I hope to even continue on to my MQP and PhD in a similar/related topic!