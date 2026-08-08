#import <AVFoundation/AVFoundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreVideo/CoreVideo.h>
#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>
#include <unistd.h>

static BOOL DrawPNGIntoPixelBuffer(NSURL *url, CVPixelBufferRef buffer, size_t width, size_t height) {
    NSData *pngData = [NSData dataWithContentsOfURL:url];
    if (!pngData) {
        fprintf(stderr, "Could not read PNG bytes: %s\n", url.path.UTF8String);
        return NO;
    }
    CGImageSourceRef source = CGImageSourceCreateWithData((__bridge CFDataRef)pngData, NULL);
    if (!source) {
        fprintf(stderr, "Could not create image source: %s\n", url.path.UTF8String);
        return NO;
    }
    CGImageRef image = CGImageSourceCreateImageAtIndex(source, 0, NULL);
    CFRelease(source);
    if (!image) {
        fprintf(stderr, "Could not decode PNG: %s\n", url.path.UTF8String);
        return NO;
    }

    CVPixelBufferLockBaseAddress(buffer, 0);
    void *baseAddress = CVPixelBufferGetBaseAddress(buffer);
    size_t bytesPerRow = CVPixelBufferGetBytesPerRow(buffer);
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGBitmapInfo bitmapInfo = kCGBitmapByteOrder32Little | kCGImageAlphaPremultipliedFirst;
    CGContextRef context = CGBitmapContextCreate(
        baseAddress, width, height, 8, bytesPerRow, colorSpace, bitmapInfo
    );
    CGColorSpaceRelease(colorSpace);
    if (!context) {
        fprintf(stderr, "Could not create bitmap context: %s\n", url.path.UTF8String);
        CGImageRelease(image);
        CVPixelBufferUnlockBaseAddress(buffer, 0);
        return NO;
    }

    CGContextSetRGBFillColor(context, 1, 1, 1, 1);
    CGContextFillRect(context, CGRectMake(0, 0, width, height));
    CGContextSetInterpolationQuality(context, kCGInterpolationHigh);
    CGContextDrawImage(context, CGRectMake(0, 0, width, height), image);

    CGContextRelease(context);
    CGImageRelease(image);
    CVPixelBufferUnlockBaseAddress(buffer, 0);
    return YES;
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 7) {
            fprintf(stderr, "Usage: encode_frames <frames_dir> <output.mp4> <width> <height> <fps> <frame_count>\n");
            return 2;
        }

        NSString *framesPath = [NSString stringWithUTF8String:argv[1]];
        NSString *outputPath = [NSString stringWithUTF8String:argv[2]];
        NSInteger width = atoi(argv[3]);
        NSInteger height = atoi(argv[4]);
        int32_t fps = atoi(argv[5]);
        NSInteger frameCount = atoi(argv[6]);
        NSURL *outputURL = [NSURL fileURLWithPath:outputPath];
        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];

        NSError *error = nil;
        AVAssetWriter *writer = [[AVAssetWriter alloc] initWithURL:outputURL fileType:AVFileTypeMPEG4 error:&error];
        if (!writer) {
            fprintf(stderr, "Cannot create writer: %s\n", error.localizedDescription.UTF8String);
            return 3;
        }

        NSDictionary *compression = @{
            AVVideoAverageBitRateKey: @5500000,
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
            AVVideoMaxKeyFrameIntervalKey: @(fps * 2)
        };
        NSDictionary *settings = @{
            AVVideoCodecKey: AVVideoCodecTypeH264,
            AVVideoWidthKey: @(width),
            AVVideoHeightKey: @(height),
            AVVideoCompressionPropertiesKey: compression
        };
        AVAssetWriterInput *input = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo outputSettings:settings];
        input.expectsMediaDataInRealTime = NO;
        if (![writer canAddInput:input]) {
            fprintf(stderr, "Cannot add video input\n");
            return 4;
        }
        [writer addInput:input];

        NSDictionary *attributes = @{
            (NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA),
            (NSString *)kCVPixelBufferWidthKey: @(width),
            (NSString *)kCVPixelBufferHeightKey: @(height),
            (NSString *)kCVPixelBufferCGImageCompatibilityKey: @YES,
            (NSString *)kCVPixelBufferCGBitmapContextCompatibilityKey: @YES
        };
        AVAssetWriterInputPixelBufferAdaptor *adaptor =
            [AVAssetWriterInputPixelBufferAdaptor assetWriterInputPixelBufferAdaptorWithAssetWriterInput:input
                                                                             sourcePixelBufferAttributes:attributes];

        if (![writer startWriting]) {
            fprintf(stderr, "startWriting failed: %s\n", writer.error.localizedDescription.UTF8String);
            return 5;
        }
        [writer startSessionAtSourceTime:kCMTimeZero];
        for (NSInteger index = 0; index < frameCount; index++) {
            @autoreleasepool {
                while (!input.readyForMoreMediaData) usleep(2000);
                CVPixelBufferRef buffer = NULL;
                CVReturn createStatus = CVPixelBufferCreate(
                    kCFAllocatorDefault,
                    width,
                    height,
                    kCVPixelFormatType_32BGRA,
                    (__bridge CFDictionaryRef)attributes,
                    &buffer
                );
                if (createStatus != kCVReturnSuccess || !buffer) {
                    fprintf(stderr, "Cannot allocate pixel buffer at frame %ld\n", (long)index);
                    return 7;
                }
                NSString *name = [NSString stringWithFormat:@"frame_%04ld.png", (long)index];
                NSURL *frameURL = [NSURL fileURLWithPath:[framesPath stringByAppendingPathComponent:name]];
                if (!DrawPNGIntoPixelBuffer(frameURL, buffer, width, height)) {
                    fprintf(stderr, "Cannot draw frame: %s\n", frameURL.path.UTF8String);
                    CVPixelBufferRelease(buffer);
                    return 8;
                }
                CMTime time = CMTimeMake(index, fps);
                if (![adaptor appendPixelBuffer:buffer withPresentationTime:time]) {
                    fprintf(stderr, "Append failed at frame %ld: %s\n", (long)index, writer.error.localizedDescription.UTF8String);
                    CVPixelBufferRelease(buffer);
                    return 9;
                }
                CVPixelBufferRelease(buffer);
            }
        }

        [input markAsFinished];
        dispatch_semaphore_t done = dispatch_semaphore_create(0);
        [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(done); }];
        dispatch_semaphore_wait(done, DISPATCH_TIME_FOREVER);
        if (writer.status != AVAssetWriterStatusCompleted) {
            fprintf(stderr, "Writer failed: %s\n", writer.error.localizedDescription.UTF8String);
            return 10;
        }
    }
    return 0;
}
