function Image_Transformation(imgName, transType, tx, ty, sx, sy, thetaDeg, makeNeg, contrastLevel, sharpness, outputDir)
    % Reads image, performs a SINGLE operation, and saves the result.

    % 1. Load Image
    img = imread(imgName);
    
    % Prepare the final image variable
    finalImg = img; 

    % 2. Switch based on selected transformation
    switch transType
        case 'Translation'
            tformtranslate = affine2d([1 0 0; 0 1 0; tx ty 1]);
            OutputView = affineOutputView(size(img), tformtranslate);
            finalImg = imwarp(img, tformtranslate, 'OutputView', OutputView , 'FillValues', [0,0,0]);

        case 'Scaling'
            if sx == 0, sx = 1; end
            if sy == 0, sy = 1; end
            tformScale = affine2d([sx 0 0; 0 sy 0; 0 0 1]);
            outputView_scale = affineOutputView(size(img), tformScale);
            finalImg = imwarp(img, tformScale, 'OutputView', outputView_scale, 'FillValues', [0,0,0]);

        case 'Rotating'
            theta = deg2rad(double(thetaDeg));
            tformrotate = affine2d([cos(theta) -sin(theta) 0;
                                    sin(theta)  cos(theta) 0;
                                    0            0         1]);
            outputView_rotate = affineOutputView(size(img), tformrotate);
            finalImg = imwarp(img, tformrotate, 'OutputView', outputView_rotate, 'FillValues', [0,0,0]);

        case 'Negative'
            finalImg = imcomplement(img);

        case 'Contrast of image'
            if contrastLevel >= 0
                factor = 1 - (contrastLevel)/100 * 0.5;
                low_in  = 0.5 - factor/2;
                high_in = 0.5 + factor/2;
                finalImg = imadjust(img, [low_in high_in], [0 1]);
            else
                factor = abs(contrastLevel) / 100;
                low_out  = factor * 0.5;
                high_out = 1 - factor * 0.5;
                finalImg = imadjust(img, [0 1], [low_out high_out]);
            end

        case 'Image Sharpening'
            strength = 2*(sharpness/100);
            finalImg = imsharpen(img, 'Amount', strength);
            
        otherwise
            % If no valid transformation is found, return original
            finalImg = img;
    end

    % 3. Save Output directly as an image file (No subplots/figures)
    outputFilename = fullfile(outputDir, 'final_comparison.jpg');
    imwrite(finalImg, outputFilename);

end