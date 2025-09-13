---
title: "ShearNet: DeconvNet Development"
date: "2025-09-13"
tags: "Research, Astrophysics"
snippet: "Developing a secondary neural network for psf deconvolution from galaxy observations."
---

# DeconvNet

I recently started making a new network for psf deconvolution! This is fun because it is completely my original neural net, where ShearNet was started by my advisor Dr. Sayan.  

## Formalizing the Goal

When a telescope takes an image, there are two primary factors at play that make the image blurry or imperfect. One is noise (which technically has two types, sky and detector noise), and the other is the point spread function (PSF). PSF is an effect caused by the physical apparatus that basically smooths out the image. The goal is to remove this PSF from the image gaining closer to what we would see when looking at the galaxy.  

The reason for this is ultimately to improve ShearNet's shear estimation. How does this connect? Something called metacalibration.

# Metacalibration

This is a harder topic to concisely explain, but I can give a basic explaination of the technical side rather than the theory.

So we start with a observation of a galaxy taken by a telescope, the observation is then deconvolved to make a clean image. That clean image is then turned into four new images, each new image has a different artificial shear applied to it. Then the images are reconvolved with the psf and the five images have the shear measured by shear estimator (in our case ShearNet). After this, we can get a reactivity of the shear estimator which can then give is us the multiplicative bias of the model.

After performing metacalibration and getting the multiplicative bias of ShearNet, we will be able to correct each prediction (hence the calibration part of metacalibration) and reduce the bias of ShearNet drastically.

The main technical challenge of this pipeline is deconvolving the psf to get the clean images for artifical shearing. This is traditionally done by FFTs, but this is computationally expense, primarily time wise, and bottlnecked by memory (some FFTs take 6+ GBs of memory). We think we can improve this process drastically by introducing DeconvNet. 

The hope is that by the time ShearNet has a full metacalibration stage, it will drastically outperform ngmix time-wise. with the addition of ngmix we'd hope for numbers around 3 minutes for 5000 samples by ShearNet vs 30 minutes for 5000 samples by ngmix. This is my guestimate that seems likely through my time working with the various pipelines, but I am excited to see!

# Current Progress

The deconvolution task is proving significantly more complicated than ShearNet's task, so I am developing a deeper and more complex neural net.

Currently I am using deep residual networks with an image encoder and decoder architecture. I have an entire secondary encoder that I utilize for psf image processing (in order to give the model some physics-informed elements). 

My next steps are to make the model drastically deeper and normalize the training data (for gradient control).

I also want to do more mundaine things like making a comparison notebook for deconvnet model.

# Conclusion

I will soon make a much more technical review of this model, hopefully within the next week :)