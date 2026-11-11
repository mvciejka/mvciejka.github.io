<?php
    /** @var $car ?\App\Model\Car */
?>

<div class="form-group">
    <label for="brand">Brand</label>
    <input type="text" id="brand" name="car[brand]" value="<?= $car ? $car->getBrand() : '' ?>">
</div>

<div class="form-group">
    <label for="model">Model</label>
    <input type="text" id="model" name="car[model]" value="<?= $car? $car->getModel() : '' ?>">
</div>
<div class="form-group">
    <label for="color">Color</label>
    <input type="text" id="color" name="car[color]" value="<?= $car ? $car->getColor() : '' ?>">
</div>

<div class="form-group">
    <label for="year">Year</label>
    <input type="number" min="1900" max="2099" step="1" id="year" name="car[year]" value="<?= $car? $car->getYear() : '' ?>">
</div>

<div class="form-group">
    <label for="additional_info">Additional informations</label>
    <textarea id="additional_info" name="car[additional_info]"><?= $car? $car->getAdditionalInfo() : '' ?></textarea>
</div>

<div class="form-group">
    <label></label>
    <input type="submit" value="Submit">
</div>
